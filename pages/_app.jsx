import Script from 'next/script'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
	return (
		<>
			<Script
				src='https://analytics.digitalnature.io/script.js'
				data-website-id='79b71caf-6f4d-4749-8ae5-7f07e1fd849b'
				data-domains='attractor-arena.biopoietic.com'
				strategy='afterInteractive'
			/>
			<Component {...pageProps} />
		</>
	)
}
