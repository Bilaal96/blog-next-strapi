import { useState } from 'react';
import useSWR from 'swr';

// components
import Head from 'next/head';
// -- custom
import HeroImage from '../../components/HeroImage/HeroImage';
import DecoratedHeading from '../../components/DecoratedHeading/DecoratedHeading';
import ArticlePreviewList from '../../components/ArticlePreviewList/ArticlePreviewList';
import Pagination from '../../components/Pagination/Pagination';
import Spinner from '../../components/Spinner/Spinner';

// utils
import { queryStrapi } from '../../utils/query-strapi';

// styles
import styles from '../../styles/pages/AllArticles.module.scss';

// constants
import { GET_PAGINATED_ARTICLES } from '../../graphql/queries';

// Number of articles per page
const ARTICLES_PER_PAGE = 10;

export default function AllArticles({ initialArticles }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Get useSWR key(s) - i.e. args passed to fetcher
  const gqlQuery = GET_PAGINATED_ARTICLES(currentPage, ARTICLES_PER_PAGE);

  // Fetch paginated articles for currentPage
  const { data: paginatedArticles, error } = useSWR(gqlQuery, queryStrapi, {
    fallback: { initialArticles },
  });

  // Renders paginated articles OR spinner if fetching articles
  const renderPaginatedArticlePreviews = () => {
    if (!paginatedArticles) {
      return <Spinner containerStyles={{ width: '100%', height: '600px' }} />;
    }

    // Rename articles data fetched from Strapi
    const articles = paginatedArticles.articles.data;
    const metadata = paginatedArticles.articles.meta;

    // Get total number of articles
    const totalArticles = metadata.pagination.total;

    // Pass props to Pagination component
    const articlePagination = (
      <Pagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={ARTICLES_PER_PAGE}
        totalItemsCount={totalArticles}
      />
    );

    return (
      <>
        {articlePagination}
        <ArticlePreviewList articles={articles} />
        {articlePagination}
      </>
    );
  };

  return (
    <>
      <Head>
        <title>All Articles | FreeRoam</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HeroImage
        title="Blog"
        src="/all-articles-header.jpg"
        alt="Person relaxing on beach reading book"
      />

      <main className={styles['all-articles']}>
        <DecoratedHeading level="2" text="All Articles" />

        {/* Error UI */}
        {error && (
          <div className={styles.error}>
            {
              'Sorry, something went wrong 😔 Please refresh ⏳ or try again later.'
            }
          </div>
        )}

        {/* Render paginated articles OR spinner if fetching articles */}
        {renderPaginatedArticlePreviews()}
      </main>
    </>
  );
}

export async function getStaticProps() {
  // Server-side render first page of articles for SEO
  const { articles: initialArticles } = await queryStrapi(
    GET_PAGINATED_ARTICLES(1, ARTICLES_PER_PAGE)
  );

  return {
    props: {
      initialArticles,
    },
  };
}
