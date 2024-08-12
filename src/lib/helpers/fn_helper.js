/**
    A sleep function that delay a program flow for some milliseconds
    @returns a resolved promise
 */
export function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**  fetchMovies - get or paginate movies
 *  @returns an object with getMovies,paginateMovies, hasMore, pageNumber method
 */
export const fetchMovies = (function () {
    let pageNumber = 1;
    let hasMore = false;

    async function getMovies({ query_term, page = 1, parameters, signal } = {}) {
        // base search url
        const yts = new URL(`https://yts.mx/api/v2/list_movies.json?page=${page}`);
        // append search term
        (query_term) && (
            yts.searchParams.append('query_term', query_term)
        );
        if (parameters) {
            for (const param in parameters) {
                yts.searchParams.append(param, parameters[param])
            }
            if (!parameters.limit) {
                yts.searchParams.append('limit', 4)
            }
        }
        return (await fetch(yts.href, {method: 'GET',signal})).json();
        // return (await fetch(yts.href, {method: 'GET'})).json();
    }

    async function paginateMovies({ query_term, page, parameters, successCallback, errorCallback, signal } = {}) {
        try {
            const { limit, page_number, movies, movie_count } = (await getMovies({ query_term, page, parameters, signal })).data;
            pageNumber = page_number;
            hasMore = (movies.length >= limit && movie_count > movies.length);
            if (movie_count && movies.length) {
                successCallback(movies)
            }
        } catch (error) {
            errorCallback(error)
        }
    }

    return {
        getMovies,
        paginateMovies,
        hasMore: () => hasMore,
        pageNumber: () => pageNumber,
    }
})()

/** yearRange  - generate a years from 1900 to the current
 * @returns an array of year between 1900 to the current year
 */
export function yearRange() {
    const years = ['1900'];
    const currentYear = (new Date(Date.now()).getFullYear());
    for (let year = 1900, i = 0; year <= currentYear; year += 10, i++) {
        if (year > 1900 && year <= 1950) {
            year += 50;
        }
        if (year >= 1950) {
            const endYear = year - 10;
            years.push(`${endYear}-${year - 1}`)
            if (currentYear - (year - 1) < 10) {
                for (i = 0; year <= currentYear; year += 1, i++) {
                    years.push(`${year}`)
                }
            }
        }
    }
    years.push('0')
    return years;
}

/** crate an return a option element. */
export function option(value, content) {
    const option = document.createElement('option')
    option.value = value;
    option.textContent = content;
    return option;
}

/** slide down element */
export async function slideDown(element, { duration = 300, onCompleted = Function } = {}) {
    await element.animate([{ height: 0 }, { height: 'auto' }], { duration, fill: 'both', easing: 'ease' }).finished;
    onCompleted?.call()
}
/** slide up element */
export async function slideUp(element, { duration = 300, onCompleted = Function } = {}) {
    await element.animate([{ height: `${element.scrollHeight}px` }, { height: 0 }], { duration, fill: 'both', easing: 'ease' }).finished;
    onCompleted?.call();
}
/** fadeIn  element from hidden to visible*/
export async function fadeIn(element, { duration = 300, onCompleted = Function } = {}) {
    await element.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: 'both', easing: 'ease' }).finished;
    onCompleted?.call();
}
/** fadeOut  element from visible to hidden*/
export async function fadeOut(element, { duration = 300, onCompleted = Function } = {}) {
    await element.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: 'both', easing: 'ease' }).finished;
    onCompleted?.call();
}
