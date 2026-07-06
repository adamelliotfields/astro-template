'use client'

import { Component, type MouseEvent } from 'react'

import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  Pagination as PaginationNav,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

type PaginationProps = {
  pathname: string
  totalItems: number
}

type PaginationState = {
  currentPage: number
}

const PAGE_SIZE = 10
const PAGE_PARAM = 'page'

// Class component with lifecycle methods to avoid erroneous Rules of Hooks error
export default class Pagination extends Component<PaginationProps, PaginationState> {
  private posts: HTMLElement[] = []

  override state: PaginationState = { currentPage: 1 }

  private get totalPages() {
    return Math.ceil(this.props.totalItems / PAGE_SIZE)
  }

  private handlePopState = () => {
    this.showPage(this.getPageFromUrl(this.totalPages))
  }

  private goToPage = (page: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    const nextPage = Math.min(Math.max(page, 1), this.totalPages)
    window.history.pushState(null, '', this.getPageHref(nextPage))

    this.showPage(nextPage)
  }

  private showPage(page: number) {
    const totalPages = this.totalPages
    const currentPage = Math.min(Math.max(page, 1), totalPages)
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE

    this.posts.forEach((post, index) => {
      post.hidden = index < start || index >= end
    })

    this.setState({ currentPage })
  }

  private getPageFromUrl(totalPages: number) {
    const params = new URLSearchParams(window.location.search)
    const page = Number(params.get(PAGE_PARAM) ?? '1')

    if (!Number.isInteger(page) || page < 1) return 1

    return Math.min(page, totalPages)
  }

  private getPageHref(page: number) {
    if (typeof window === 'undefined') {
      return page === 1 ? this.props.pathname : `${this.props.pathname}?${PAGE_PARAM}=${page}`
    }

    const url = new URL(window.location.href)

    if (page === 1) {
      url.searchParams.delete(PAGE_PARAM)
    } else {
      url.searchParams.set(PAGE_PARAM, String(page))
    }

    return `${url.pathname}${url.search}${url.hash}`
  }

  override componentDidMount() {
    if (this.totalPages <= 1) return

    this.posts = Array.from(document.querySelectorAll<HTMLElement>('[data-blog-post]'))
    this.showPage(this.getPageFromUrl(this.totalPages))

    window.addEventListener('popstate', this.handlePopState)
  }

  override componentWillUnmount() {
    this.posts.forEach((post) => {
      post.hidden = false
    })

    window.removeEventListener('popstate', this.handlePopState)
  }

  override render() {
    const { currentPage } = this.state
    const totalPages = this.totalPages

    if (totalPages <= 1) return null

    return (
      <PaginationNav className="mt-16">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
              href={this.getPageHref(Math.max(currentPage - 1, 1))}
              onClick={this.goToPage(currentPage - 1)}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href={this.getPageHref(page)}
                  isActive={page === currentPage}
                  onClick={this.goToPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          <PaginationItem>
            <PaginationNext
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
              href={this.getPageHref(Math.min(currentPage + 1, totalPages))}
              onClick={this.goToPage(currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationNav>
    )
  }
}
