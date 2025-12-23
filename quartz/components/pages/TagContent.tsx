import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"

interface TagContentOptions {
  sort?: SortFn
  numPages: number
}

const defaultOptions: TagContentOptions = {
  numPages: 10,
}

export default ((opts?: Partial<TagContentOptions>) => {
  const options: TagContentOptions = { ...defaultOptions, ...opts }

  const TagContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props
    const slug = fileData.slug

    if (!(slug?.startsWith("tags/") || slug === "tags")) {
      throw new Error(`Component "TagContent" tried to render a non-tag page: ${slug}`)
    }

    const tag = simplifySlug(slug.slice("tags/".length) as FullSlug)
    const allPagesWithTag = (tag: string) =>
      allFiles.filter((file) =>
        (file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag),
      )

    // Generate parent tag breadcrumbs and child tags for nested tags
    const renderTagNavigation = (currentTag: string) => {
      if (!currentTag || currentTag === "/") return null
      
      const segments = currentTag.split("/")
      
      // Find all child tags
      const allTags = [
        ...new Set(
          allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes),
        ),
      ]
      const childTags = allTags.filter(t => {
        const tSegments = t.split("/")
        return tSegments.length === segments.length + 1 && t.startsWith(currentTag + "/")
      }).sort((a, b) => a.localeCompare(b))
      
      // Generate parent breadcrumbs
      const breadcrumbs = []
      for (let i = 0; i < segments.length - 1; i++) {
        const parentTag = segments.slice(0, i + 1).join("/")
        const tagListingPage = `/tags/${parentTag}` as FullSlug
        const href = resolveRelative(fileData.slug!, tagListingPage)
        
        breadcrumbs.push(
          <span key={parentTag}>
            <a class="internal tag-link" href={href}>
              {parentTag}
            </a>
            {" / "}
          </span>
        )
      }
      
      // Generate child tag links
      const childLinks = childTags.map((childTag, idx) => {
        const tagListingPage = `/tags/${childTag}` as FullSlug
        const href = resolveRelative(fileData.slug!, tagListingPage)
        const childName = childTag.split("/").pop()
        
        return (
          <span key={childTag}>
            <a class="internal tag-link" href={href}>
              {childName}
            </a>
            {idx < childTags.length - 1 ? ", " : ""}
          </span>
        )
      })
      
      const hasParents = segments.length > 1
      const hasChildren = childTags.length > 0
      
      if (!hasParents && !hasChildren) return null
      
      return (
        <div style="margin-bottom: 1rem; color: var(--gray); font-size: 0.9rem; line-height: 1.6;">
          {hasParents && (
            <div>
              {breadcrumbs}
              <span style="color: var(--dark);">{segments[segments.length - 1]}</span>
            </div>
          )}
          {hasChildren && (
            <div style="margin-top: 0.5rem;">
              <span style="color: var(--gray);">Child tags: </span>
              {childLinks}
            </div>
          )}
        </div>
      )
    }

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")
    if (tag === "/") {
      const tags = [
        ...new Set(
          allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes),
        ),
      ].sort((a, b) => a.localeCompare(b))
      const tagItemMap: Map<string, QuartzPluginData[]> = new Map()
      for (const tag of tags) {
        tagItemMap.set(tag, allPagesWithTag(tag))
      }
      return (
        <div class="popover-hint">
          <article class={classes}>
            <p>{content}</p>
          </article>
          <p>{i18n(cfg.locale).pages.tagContent.totalTags({ count: tags.length })}</p>
          <div>
            {tags.map((tag) => {
              const pages = tagItemMap.get(tag)!
              const listProps = {
                ...props,
                allFiles: pages,
              }

              const contentPage = allFiles.filter((file) => file.slug === `tags/${tag}`).at(0)

              const root = contentPage?.htmlAst
              const content =
                !root || root?.children.length === 0
                  ? contentPage?.description
                  : htmlToJsx(contentPage.filePath!, root)

              const tagListingPage = `/tags/${tag}` as FullSlug
              const href = resolveRelative(fileData.slug!, tagListingPage)

              return (
                <div>
                  <h2>
                    <a class="internal tag-link" href={href}>
                      {tag}
                    </a>
                  </h2>
                  {content && <p>{content}</p>}
                  <div class="page-listing">
                    <p>
                      {i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}
                      {pages.length > options.numPages && (
                        <>
                          {" "}
                          <span>
                            {i18n(cfg.locale).pages.tagContent.showingFirst({
                              count: options.numPages,
                            })}
                          </span>
                        </>
                      )}
                    </p>
                    <PageList limit={options.numPages} {...listProps} sort={options?.sort} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      const pages = allPagesWithTag(tag)
      const listProps = {
        ...props,
        allFiles: pages,
      }

      return (
        <div class="popover-hint">
          {renderTagNavigation(tag)}
          <article class={classes}>{content}</article>
          <div class="page-listing">
            <p>{i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}</p>
            <div>
              <PageList {...listProps} sort={options?.sort} />
            </div>
          </div>
        </div>
      )
    }
  }

  TagContent.css = concatenateResources(style, PageList.css)
  return TagContent
}) satisfies QuartzComponentConstructor