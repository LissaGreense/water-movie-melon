import MovieMenu from "./movieMenu.tsx";
import TopMovies from "./movieTopFilms.tsx";


export const HomePage = () => {
    return (
        <>
            <div className={'logoBar'}>
            </div>
            <div className={'pageContent'}>
                <div className={'topMovies'}>
                   <TopMovies/>
                </div>
                <div className={'bucketSpace'}>
                    wiadro z filmami
                    <div className={'userMenu'}>
                        <MovieMenu/>
                    </div>
                </div>
            </div>
        </>
    )
}

