import Head from 'next/head'

const BASE_URL = 'https://attractor-arena.biopoietic.com'

/**
 * SEO Component for managing meta tags across the application
 *
 * @param {Object} props
 * @param {string} props.title - Page title (will be suffixed with site name)
 * @param {string} props.description - Page description
 * @param {string} [props.ogType='website'] - Open Graph type (website, article, profile, etc.)
 * @param {string} [props.ogTitle] - Open Graph title (defaults to title)
 * @param {string} [props.ogDescription] - Open Graph description (defaults to description)
 * @param {string} [props.ogImage='/og/home.png'] - Open Graph image path
 * @param {string} [props.twitterCard='summary_large_image'] - Twitter card type
 * @param {string} [props.twitterTitle] - Twitter title (defaults to ogTitle or title)
 * @param {string} [props.twitterDescription] - Twitter description (defaults to ogDescription or description)
 * @param {string} [props.twitterImage] - Twitter image (defaults to ogImage)
 */
export default function SEO({
	title,
	description,
	ogType = 'website',
	ogTitle,
	ogDescription,
	ogImage = '/og/home.png',
	twitterCard = 'summary_large_image',
	twitterTitle,
	twitterDescription,
	twitterImage,
}) {
	// Helper to convert relative paths to absolute URLs
	const toAbsoluteUrl = (path) => (path?.startsWith('http') ? path : `${BASE_URL}${path}`)

	// Construct meta tags
	const meta = {
		og: {
			title: ogTitle || title,
			description: ogDescription || description,
			image: toAbsoluteUrl(ogImage),
		},
		twitter: {
			title: twitterTitle || ogTitle || title,
			description: twitterDescription || ogDescription || description,
			image: toAbsoluteUrl(twitterImage || ogImage),
		},
	}

	return (
		<Head>
			<title>{title}</title>
			<meta name='description' content={description} />

			{/* Open Graph */}
			<meta property='og:type' content={ogType} />
			<meta property='og:title' content={meta.og.title} />
			<meta property='og:description' content={meta.og.description} />
			<meta property='og:image' content={meta.og.image} />
			<meta property='og:image:width' content='1200' />
			<meta property='og:image:height' content='630' />

			{/* Twitter Card */}
			<meta name='twitter:card' content={twitterCard} />
			<meta name='twitter:title' content={meta.twitter.title} />
			<meta name='twitter:description' content={meta.twitter.description} />
			<meta name='twitter:image' content={meta.twitter.image} />
		</Head>
	)
}
