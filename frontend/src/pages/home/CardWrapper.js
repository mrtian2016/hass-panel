import { useEffect, useRef } from 'react';

const CardWrapper = ({ children, onHeightChange,style }) => {
    const cardRef = useRef(null);
  
    useEffect(() => {
      if (cardRef.current) {
        const height = cardRef.current.offsetHeight;
        onHeightChange(height);
      }
    }, [onHeightChange]);
  
    return <div style={style} ref={cardRef}>{children}</div>;
  };

export default CardWrapper;