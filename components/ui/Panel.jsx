const Panel = ({ header, children }) => {
	return (
		<section className='border border-zinc-800'>
			{header ? <header className='px-8 py-4 border-b border-zinc-800'>{header}</header> : null}

			<div className='p-8'>{children}</div>
		</section>
	)
}

export default Panel
