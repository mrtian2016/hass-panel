import React, { useRef, useEffect, useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';

function GroupTabs({ groups, activeGroup, onGroupChange, isEditing }) {
  const { t } = useLanguage();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // 检查是否需要显示滚动箭头
  const checkScrollArrows = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollArrows();
    window.addEventListener('resize', checkScrollArrows);
    return () => window.removeEventListener('resize', checkScrollArrows);
  }, [groups]);

  // 滚动处理
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // 确保有"全部"分组
  const allGroups = [
    { id: '_all', name: t('groups.all'), order: -1 },
    ...groups.sort((a, b) => a.order - b.order)
  ];

  // 如果没有自定义分组，且不在编辑模式，则不显示分组标签栏
  // 但是如果有至少一个自定义分组，就应该显示(因为还有"全部"选项可以切换)
  if (!isEditing && (!groups || groups.length === 0)) {
    return null;
  }

  return (
    <div className="group-tabs-container">
      {showLeftArrow && (
        <button
          className="group-scroll-arrow left"
          onClick={() => scroll('left')}
          aria-label="向左滚动"
        >
          <Icon path={mdiChevronLeft} size={14} />
        </button>
      )}

      <div
        className="group-tabs-scroll"
        ref={scrollContainerRef}
        onScroll={checkScrollArrows}
      >
        <div className="group-tabs">
          {allGroups.map(group => (
            <button
              key={group.id}
              className={`group-tab ${activeGroup === group.id ? 'active' : ''}`}
              onClick={() => onGroupChange(group.id)}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {showRightArrow && (
        <button
          className="group-scroll-arrow right"
          onClick={() => scroll('right')}
          aria-label="向右滚动"
        >
          <Icon path={mdiChevronRight} size={14} />
        </button>
      )}
    </div>
  );
}

export default GroupTabs;
