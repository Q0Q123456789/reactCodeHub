import PageContainer from "@/components/Container/index.tsx"
import React, { useEffect, useRef, useState } from 'react'
import { Listy } from 'antd';

interface Card {
	id: number
	title: string
	description: string
}

const fetchCards = (page: number, pageSize: number): Promise<Card[]> => {
	// 模拟异步请求
	return new Promise((resolve) => {
		setTimeout(() => {
			const cards = Array.from({ length: pageSize }, (_, i) => ({
				id: page * pageSize + i,
				title: `卡片标题 ${page * pageSize + i + 1}`,
				description: `这是第 ${page * pageSize + i + 1} 个卡片的描述。`
			}))
			resolve(cards)
		}, 800)
	})
}

const InfiniteScroll: React.FC = () => {
	const [cards, setCards] = useState<Card[]>([])
	const [page, setPage] = useState(0)
	const [loading, setLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const containerRef = useRef<HTMLDivElement>(null)
	const [listHeight, setListHeight] = useState(0);

	const PAGE_SIZE = 150

	useEffect(() => {
		const loadCards = async () => {
			setLoading(true)
			const newCards = await fetchCards(page, PAGE_SIZE)
			setCards((prev) => [...prev, ...newCards])
			setHasMore(newCards.length === PAGE_SIZE)
			setLoading(false)
		}
		loadCards()
	}, [page])

	useEffect(() => {
		const handleScroll = () => {
			const container = containerRef.current
			if (
				container &&
				container.scrollHeight - container.scrollTop <=
					container.clientHeight + 100 &&
				!loading &&
				hasMore
			) {
				setPage((prev) => prev + 1)
			}
		}
		const container = containerRef.current
		if (container) {
			container.addEventListener('scroll', handleScroll)
		}
		return () => {
			if (container) {
				container.removeEventListener('scroll', handleScroll)
			}
		}
	}, [loading, hasMore])
	
	useEffect(() => {
		const el = document.querySelector('.ant-layout-content');
		if (!el) return;
		
		const ro = new ResizeObserver(() => {
			// 减去 40px 的留白/头部空间
			setListHeight(el.clientHeight - 20);
		});
		
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	return (
		<PageContainer>
			<div
				ref={containerRef}
				style={{
					width: '100%'
				}}
			>
				<Listy<Card> virtual height={listHeight}  items={cards} rowKey='id' itemRender={(item) => (
					<div
						key={item.id}
						style={{
							background: '#fff',
							borderRadius: 8,
							boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
							padding: 16,
							width: '220px'
						}}
					>
						<h3>{item.title}</h3>
						<p>{item.description}</p>
					</div>
				)} />
				{loading && (
					<div style={{ textAlign: 'center', margin: 16 }}>加载中...</div>
				)}
				{!hasMore && (
					<div style={{ textAlign: 'center', margin: 16 }}>没有更多了</div>
				)}
			</div>
		</PageContainer>
	)
}

export default InfiniteScroll
