import MovieMenu from "./movieMenu.tsx";
import TopMovies from "./movieTopFilms.tsx";
import bucket from "../assets/bucketph.png"


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
                    <img className={'bucket'} alt={'bucket'} src={bucket}/>
                    <div className={'userMenu'}>
                        <MovieMenu/>
                    </div>
                </div>
            </div>
        </>
    )
}

