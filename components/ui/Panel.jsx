const Panel = ({ header, children }) => {
	return (
		<section className='bg-brand-surface border border-brand-border'>
			{header ? <header className='px-8 py-4 border-b border-brand-border'>{header}</header> : null}

			<div className='p-8'>{children}</div>
		</section>
	)
}

export default Panel
