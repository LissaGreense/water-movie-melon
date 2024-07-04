
import {useEffect, useState} from 'react';
import { Rating } from 'primereact/rating';
import {getMovies} from "../connections/internal/movie.ts";
import {Movie} from "../types/internal/movie.ts";
import {Button} from "primereact/button";
import { Sidebar } from 'primereact/sidebar';
import cover from '../assets/coverplaceholder.jpg'
import {VirtualScroller} from "primereact/virtualscroller";

interface TopFilms {
    title: string;
    link: string;
    user: string;
    date_added: string;
    genre: string;
    rating: number;
    image: string;
}

export default function TopMovies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        getMovies()
            .then((moviesData) => {
                setMovies(moviesData);
            })
            .catch((error) => {
                console.error('Error fetching movies:', error);
            });
    }, []);

    const itemTemplate = (data: TopFilms) => {
        return (

            <div className={'topMovieDiv'}>
                <div className={'topMovieCoverDiv'}>
                    <img className="topMovieCover" src={cover} alt={data.title}/>
                </div>
                <div
                    className="topMovieCoverData">
                    <div>
                        <div>
                            <div className="textSans">{data.title}</div>
                        </div>
                        <div className="flex flex-column gap-2">
                            <Rating value={data.rating} readOnly cancel={false}></Rating>
                            <span className="flex align-items-center gap-2">
                                    <i className="pi pi-tag product-category-icon"></i>
                                    <span className="textSansNoBorder">{data.genre}</span>
                                </span>
                        </div>
                    </div>
                </div>
            </div>

        );
    };

    return (
        <div className="card flex justify-content-center">
            <Sidebar visible={visible} onHide={() => setVisible(false)}>
                <h2>Top Movies</h2>
                <div className="card">
                    <VirtualScroller items={movies} itemTemplate={itemTemplate} itemSize={7} scrollHeight="500px"/>
                </div>
            </Sidebar>
            <Button label='TOP MOVIES' onClick={() => setVisible(true)}/>
        </div>
    )
}
