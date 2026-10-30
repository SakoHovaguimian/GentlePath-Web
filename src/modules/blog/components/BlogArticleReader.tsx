import { blogCategoryLabel } from '../models/blogCategory';
import Image from 'next/image';
import { MarkdownContent } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
import type { BlogArticle } from '../models/blogArticle';
import { blogCoverSource } from '../models/blogCover';
import styles from '../Blog.module.css';
import { BlogDate } from './BlogDate';
import { BlogContentReader } from './BlogContentReader';
import { blogContentText } from '../content/blogContentText';
import { BlogEngagementControls } from '@/modules/engagement/components/BlogEngagementControls';

export function BlogArticleReader({
  article,
  preview = false,
}: {
  article: BlogArticle;
  preview?: boolean;
}) {
  const date = article.publishedAt || article.updatedAt;
  return (
    <article className={styles.reader}>
      <header className={styles.readerHeader}>
        <p className={styles.topic}>
          {preview
            ? copy.draftPreviewLabel
            : blogCategoryLabel(article.category)}
        </p>
        <h1>{article.title || copy.unsavedPreviewTitle}</h1>
        <p className={styles.readerDescription}>{article.description}</p>
        <div className={styles.readerByline}>
          <span>{copy.authorByline(article.author || copy.defaultAuthor)}</span>
          <BlogDate value={date} long />
          <span>
            {copy.readingTime(
              Math.max(
                1,
                Math.ceil(
                  `${blogContentText(article.content)} ${article.body ?? ''}`.split(
                    /\s+/,
                  ).length / 200,
                ),
              ),
            )}
          </span>
        </div>
      </header>
      {!preview && (
        <BlogEngagementControls articleId={article.id} slug={article.slug} />
      )}
      <div className={styles.readerCover} data-cover={article.cover}>
        <Image
          priority
          src={blogCoverSource(article.cover)}
          unoptimized
          width={1000}
          height={600}
          alt={copy.coverAlt(article.title)}
          sizes="(max-width: 900px) 94vw, 900px"
        />
      </div>
      <div className={styles.readerBody}>
        {article.content.length ? (
          <BlogContentReader content={article.content} />
        ) : !article.body?.trim() ? (
          <p>{copy.previewEmpty}</p>
        ) : null}
        {article.body?.trim() && (
          <MarkdownContent value={article.body} headingContext="article" />
        )}
      </div>
    </article>
  );
}
