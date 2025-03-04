import React, { useState, useEffect } from 'react';
import BaseCard from '../BaseCard';
import { mdiFormatQuoteClose } from '@mdi/js';
import { Spin } from 'antd';
import './style.css';

function DailyQuoteCard({ config }) {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    const getCacheKey = (apiType) => `daily_quote_cache_${apiType}`;

    const isValidCache = (cache) => {
        if (!cache) return false;
        const now = new Date().getTime();
        // 检查缓存时间和数据完整性
        return now - cache.timestamp < 3600000 && // 1小时内的缓存有效
               cache.quote &&
               typeof cache.quote.content === 'string' &&
               cache.quote.content.trim() !== '';
    };

    // 验证引言数据的有效性
    const isValidQuote = (quote) => {
        return quote &&
               typeof quote.content === 'string' &&
               quote.content.trim() !== '';
    };

    useEffect(() => {
        const fetchQuote = async () => {
            setLoading(true);
            try {
                if (config.quotes.source === 'manual') {
                    const manualQuote = {
                        content: config.quotes.content,
                        author: config.quotes.author
                    };
                    if (isValidQuote(manualQuote)) {
                        setQuote(manualQuote);
                    } else {
                        setQuote({
                            content: '请在配置中设置引言内容',
                            author: ''
                        });
                    }
                } else {
                    // 尝试从缓存获取数据
                    const cacheKey = getCacheKey(config.quotes.apiEndpoint);
                    let cachedData = null;
                    try {
                        cachedData = JSON.parse(localStorage.getItem(cacheKey));
                    } catch (e) {
                        localStorage.removeItem(cacheKey);
                    }

                    if (isValidCache(cachedData)) {
                        setQuote(cachedData.quote);
                    } else {
                        const response = await fetch('./api/daily_quote?api=' + config.quotes.apiEndpoint);
                        const data = await response.json();

                        // 根据不同API格式处理数据
                        let processedQuote = {};
                        switch (config.quotes.apiEndpoint) {
                            case 'hitokoto':
                                processedQuote = {
                                    content: data.hitokoto,
                                    author: data.from_who || data.from
                                };
                                break;
                            case 'iciba':
                                processedQuote = {
                                    content: data.content,
                                    author: data.note
                                };
                                break;
                            case 'jinrishici':
                                processedQuote = {
                                    content: data.data.content,
                                    author: `${data.data.origin.author} · ${data.data.origin.title}`
                                };
                                break;
                            case 'shanbay':
                                processedQuote = {
                                    content: data.content,
                                    author: data.author
                                };
                                break;
                            default:
                                throw new Error('无效的API配置');
                        }
                        
                        // 只缓存有效的数据
                        if (isValidQuote(processedQuote)) {
                            const cacheData = {
                                quote: processedQuote,
                                timestamp: new Date().getTime()
                            };
                            try {
                                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                            } catch (e) {
                                console.error('缓存存储失败:', e);
                            }
                            setQuote(processedQuote);
                        } else {
                            throw new Error('API返回的数据无效');
                        }
                    }
                }
            } catch (error) {
                console.error('获取每日一言失败:', error);
                // 如果请求失败，尝试使用过期缓存
                const cacheKey = getCacheKey(config.quotes.apiEndpoint);
                try {
                    const cachedData = JSON.parse(localStorage.getItem(cacheKey));
                    if (cachedData?.quote && isValidQuote(cachedData.quote)) {
                        setQuote(cachedData.quote);
                        return;
                    }
                } catch (e) {
                    localStorage.removeItem(cacheKey);
                }
                
                setQuote({
                    content: '获取失败',
                    author: '请检查网络连接'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchQuote();
        // 每小时更新一次
        const interval = setInterval(fetchQuote, 3600000);
        return () => clearInterval(interval);
    }, [config.quotes]);

    return (
        <BaseCard
            title={config.title || "每日一言"}
            titleVisible={config.titleVisible}
            icon={mdiFormatQuoteClose}
        >
            <div className="daily-quote-content">
                {loading ? (
                    <div className="quote-loading">
                        <Spin />
                    </div>
                ) : (
                    <>
                        <div className="quote-text">{quote?.content}</div>
                        {quote?.author && <div className="quote-author">—— {quote.author}</div>}
                    </>
                )}
            </div>
        </BaseCard>
    );
}

export default DailyQuoteCard; 