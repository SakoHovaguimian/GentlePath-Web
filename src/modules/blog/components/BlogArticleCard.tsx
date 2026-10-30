import { blogCategoryLabel } from '../models/blogCategory';
import Image from 'next/image';
import Link from 'next/link';
import { UiIcon } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
import type { BlogArticle } from '../models/blogArticle';
import { blogCoverSource } from '../models/blogCover';
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
    <article className={styles.articleCard} data-cover={article.cover}>
      <Link
        href={`/blog/${article.slug}`}
        className={styles.cardImage}
        tabIndex={-1}
        aria-hidden="true"
        data-cover={article.cover}
      >
        <Image
          src={blogCoverSource(article.cover)}
          unoptimized
          alt={copy.decorativeAlt}
          width={640}
          height={480}
          sizes="(max-width: 600px) 32vw, (max-width: 1000px) 28vw, 19vw"
        />
      </Link>
      <div className={styles.cardCopy}>
        <p className={styles.topic}>{blogCategoryLabel(article.category)}</p>
        <Heading>
          <Link className={styles.cardOpen} href={`/blog/${article.slug}`}>
            {article.title}
          </Link>
        </Heading>
        <p className={styles.description}>{article.description}</p>
        <div className={styles.byline}>
          <span>{article.author}</span>
          <BlogDate value={article.publishedAt || article.updatedAt} />
        </div>
      </div>
      <Link href={`/blog/${article.slug}`} className={styles.readLink}>
        {copy.readArticle}
        <UiIcon name="arrowRight" />
      </Link>
    </article>
  );
}
