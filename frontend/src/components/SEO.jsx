import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, name, type }) {
    return (
        <Helmet>
            { /* Standard metadata tags */ }
            <title>{title}</title>
            <meta name='description' content={description} />
            
            { /* Facebook tags */ }
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            
            { /* Twitter tags */ }
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
}

SEO.defaultProps = {
    title: "SANKALP Sports Club",
    description: "Follow live matches, view our interactive player gallery, and register for upcoming tournaments at SANKALP Sports Club!",
    name: "SANKALP Sports Club",
    type: "website"
};
