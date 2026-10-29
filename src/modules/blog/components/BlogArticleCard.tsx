import Image from 'next/image';
import Link from 'next/link';
import { gentlePathBlogStrings as copy } from '@/strings';
import type { BlogArticle } from '../models/blogArticle';
import { blogCoverAssets } from '../models/blogCover';
import styles from '../Blog.module.css';
import { BlogDate } from './BlogDate';

export function BlogArticleCard({
  article,
  headingLevel = 'h2',
}: {
  article: BlogArticle;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  return (
    <article className={styles.articleCard}>
      <Link
        href={`/blog/${article.slug}`}
        className={styles.cardImage}
        tabIndex={-1}
        aria-hidden="true"
        data-cover={article.cover}
      >
        <Image
          src={blogCoverAssets[article.cover]}
          alt={copy.decorativeAlt}
          width={640}
          height={480}
          sizes="(max-width: 700px) 90vw, (max-width: 1000px) 45vw, 30vw"
        />
      </Link>
      <div className={styles.cardCopy}>
        <p className={styles.topic}>{copy.categories[article.category]}</p>
        <Heading>
          <Link href={`/blog/${article.slug}`}>{article.title}</Link>
        </Heading>
        <p className={styles.description}>{article.description}</p>
        <div className={styles.byline}>
          <span>{article.author}</span>
          <BlogDate value={article.publishedAt || article.updatedAt} />
        </div>
      </div>
    </article>
  );
}
