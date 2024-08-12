import { sleep, yearRange, fetchMovies, option, slideUp, slideDown, fadeIn, fadeOut } from './helpers/fn_helper.js';
import { languages, orders } from './utils/utils.js'
import { html, render, svg } from 'lit-html';

import './components/component.theme_switcher.js';
import "./components/component.lazy_image.js";

document.addEventListener('DOMContentLoaded', (e) => {
    searchFunction();
})

function searchFunction() {
    const searchForm = document.querySelector('form#searchForm');
    const searchFilter = searchForm.querySelector('#sPanelFilter');
    const searchResult = searchForm.querySelector('#sPanelResult');
    const loadingPanel = searchResult.querySelector('#sPanelLoading')
    let abortController = new AbortController()
    /** */
    searchForm.querySelectorAll('select').forEach(select => {
        switch (select.name) {
            case 'year': {
                const yearSelect = searchForm.querySelector('select[name=year]');
                yearRange().reverse().forEach(range => {
                    yearSelect.appendChild(option(range, range === '0' ? 'All' : range));
                });
            } break;
            case 'rating': {
                const rateSelect = searchForm.querySelector('select[name=rating]');
                Array.from({ length: 10 }).reverse().forEach((_, item) => {
                    rateSelect.appendChild(option(item, item === 0 ? 'All' : `${item}+`))
                });
            } break;
            case 'genre': {
                const genreSelect = searchForm.querySelector('select[name=genre]');
                'All,Action,Adventure,Animation,Biography,Comedy,Crime,Documentary,Drama,Family,Fantasy,Film-Noir,Game-Show,History,Horror,Romance,News,Music,Musical,Mystery,Reality-TV,Sci-Fi,Sport,Thriller,Talk-Show,War,Western'.split(',').forEach(genre => {
                    genreSelect.appendChild(option(genre.toLowerCase(), genre))
                });
            } break;
            case 'quality': {
                const qualitySelect = searchForm.querySelector('select[name=quality]');
                'All,480p,720p,1080p,1080p.x265,2160p,3D'.split(',').forEach(quality => {
                    qualitySelect.appendChild(option(quality, quality))
                });
            } break;
            case 'sort_by': {
                const sortBySelect = searchForm.querySelector('select[name=sort_by]');
                for (const key of ['date_added', 'title', 'year', 'rating', 'peers', 'seeds', 'download_count', 'like_count']) {
                    sortBySelect.appendChild(option(key, key))
                }
            } break;
            case 'order_by': {
                const orderBySelect = searchForm.querySelector('select[name=order_by]');
                for (const key in orders) {
                    orderBySelect.appendChild(option(key, orders[key]))
                }
            } break;
            case 'language': {
                const langSelect = searchForm.querySelector('select[name=language]');
                for (const key in languages) {
                    langSelect.appendChild(option(key, languages[key]))
                }
            } break;
        }
        select.addEventListener('change', function () {
            if (select.name === 'year') {
                const sortBySelect = searchForm.querySelector('select[name=sort_by]');
                select.value !== '0' ? sortBySelect.value = 'year' : sortBySelect.value = 'date_added';
            }
        })
    })
    /** */
    searchForm.querySelector('[type=button]#filterButton').addEventListener('click', function () {
        // Toggle the Filter Pane
        if (this.hasAttribute('closed')) {
            slideUp(searchResult, {
                duration: 0,
                onCompleted: () => slideDown(searchFilter, {
                    onCompleted: () => this.removeAttribute('closed')
                })
            });
        } else {
            slideUp(searchFilter, { onCompleted: () => this.setAttribute('closed', '') });
        }
    });
    /** */
    searchResult.querySelector('#closeSPanelBtn').addEventListener('click', () => {
        slideUp(searchResult);
        abortController.abort()
    });
    /** */
    searchResult.querySelector('#sPanelData').addEventListener('scroll', async e => {
        const { scrollHeight, clientHeight, scrollTop } = e.target;
        if ((Math.ceil(scrollTop + clientHeight) + 1) >= scrollHeight) {
            if (fetchMovies.hasMore()) {
                await fadeIn(loadingPanel, { onCompleted: async () => await getMore() })
            }
        }
    })
    /** */
    searchForm.addEventListener('submit', async e => {
        e.preventDefault();
        abortController = new AbortController()
        /** */
        slideUp(searchFilter, { duration: 0, onCompleted: () => searchForm.querySelector('[type=button]#filterButton').setAttribute('closed', '') });
        /** */
        const searchPanel = searchResult.querySelector('#sPanelData');
        /** */
        const query_term = searchForm.querySelector('input[type=search]').value;
        /** */
        render(html`<p style="display:flex;gap:1em;align-items:center;color:hsl(102, 49%, 51%)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="200" height="200" style="shape-rendering: auto; display: inline-block; background: transparent;" xmlns:xlink="http://www.w3.org/1999/xlink">${svg`<circle stroke-linecap="round" fill="none" stroke-dasharray="69.11503837897544 69.11503837897544" stroke="hsl(102, 49%, 51%)" stroke-width="10" r="44" cy="50" cx="50"><animateTransform values="0 50 50;360 50 50" keyTimes="0;1" dur="3.4482758620689653s" repeatCount="indefinite" type="rotate" attributeName="transform"></animateTransform></circle><g></g></g><g>`}</svg>Searching for <strong>${query_term || 'Any movies.'}</strong></p>`, searchPanel);
        /** */
        slideDown(searchResult);
        /** */
        await sleep(500);
        /** */
        await fetchMovies.paginateMovies({
            query_term,
            signal: abortController.signal,
            parameters: queryParameters(),
            errorCallback: () => {
                render(html`<p style="color:red">Oops!, something went wrong, please try again.</p>`, searchPanel)
            },
            successCallback: (movies) => {
                if (movies.length) {
                    const ul = document.createElement('ul')
                    uList(ul, movies);
                    render(ul, searchPanel)
                } else {
                    render(html`<p>No Match found for <strong>${term}<strong></p>`, searchPanel)
                }
            }
        })
        slideDown(searchResult);
    })
    /** */
    async function getMore() {
        const loadingPanel = searchResult.querySelector('#sPanelLoading');
        const query_term = searchForm.querySelector('input[type=search]').value;
        /** */
        await sleep(500);
        await fetchMovies.paginateMovies({
            query_term: query_term,
            signal: abortController.signal,
            parameters: queryParameters(),
            page: fetchMovies.pageNumber() + 1,
            errorCallback: (error) => {
                loadingPanel.textContent = 'Oops!, error.';
                fadeIn(loadingPanel, {
                    onCompleted: async () => {
                        await sleep(5000);
                        await fadeOut(loadingPanel)
                    }
                })
            },
            successCallback: (movies) => {
                if (movies.length) {
                    uList(searchResult.querySelector('#sPanelData ul'), movies);
                    fadeOut(loadingPanel);
                }
            }
        })
    }
    const queryParameters = () => {
        const parameters = {}
        searchFilter.querySelectorAll('select').forEach(select => {
            parameters[select.getAttribute('name')] = select.value;
        })
        return parameters;
    }
    const uList = (ul, movies) => {
        const strong = (torrents, prop1, prop2) => {
            let strong = '<strong>';
            torrents.forEach(v => {
                strong += v[prop1] ?? v;
                (prop2) && (strong += '-' + v[prop2])
                strong += ' , ';
            })
            strong += '</strong>';
            return strong
        }
        for (const movie of movies) {
            const li = document.createElement('li');
            const {id, title, year, rating,summary, genres, torrents, large_cover_image, yt_trailer_code} = movies;
            li.setHTMLUnsafe(`
                        <a data-meta="${id}-${yt_trailer_code}">
                            <figure>
                                <lazy-image src="${large_cover_image}" alt="${summary}"></lazy-image>
                                    <figcaption>
                                        <header>
                                            <h1>${title}  <sup>${year}</sup></h1>
                                            <span></span>
                                            <span><strong>Rate ${rating}</strong></span>
                                        </header>
                                        <table>
                                            <thead><tr><th>Qualities</th><th>Sizes</th><th>Genres</th></tr></thead>
                                            <tbody>
                                                    <tr>
                                                        <td>${strong(torrents, 'type', 'quality')}</td>
                                                        <td>${strong(torrents, 'size')}</td>
                                                        <td>${strong(genres)}</td>
                                                    </tr>
                                            </tbody>
                                        </table>
                                    </figcaption>
                            </figure>
                        </a>
            `);
            ul.appendChild(li)
        }
    }
}
