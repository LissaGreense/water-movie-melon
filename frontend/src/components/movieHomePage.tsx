import MovieMenu from "./movieMenu.tsx";
import TopMovies from "./movieTopFilms.tsx";
import {MovieNightCounter} from "./movieNightCounter.tsx";


export const HomePage = () => {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() +3)
    return (
        <>
            <div className={'logoBar'}>
            </div>
            <div className={'pageContent'}>
                <div className={'topMovies'}>
                   <TopMovies/>
                </div>
                <div className={'bucketSpace'}>
                    <MovieNightCounter nextNightDate={currentDate}/>
                    wiadro z filmami
                    <div className={'userMenu'}>
                        <MovieMenu/>
                    </div>
                </div>
            </div>
        </>
    )
}

