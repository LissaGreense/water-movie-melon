
import {useEffect, useState} from 'react';
import { DataScroller } from 'primereact/datascroller';
import { Rating } from 'primereact/rating';
import {getMovies} from "../connections/internal/movie.ts";
import {Movie} from "../types/internal/movie.ts";
import {Button} from "primereact/button";
import { Sidebar } from 'primereact/sidebar';

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

            <div className="col-12">
                <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
                    <img className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"  alt={data.title} />
                    <div className="flex flex-column lg:flex-row justify-content-between align-items-center xl:align-items-start lg:flex-1 gap-4">
                        <div className="flex flex-column align-items-center lg:align-items-start gap-3">
                            <div className="flex flex-column gap-1">
                                <div className="text-2xl font-bold text-900">{data.title}</div>
                            </div>
                            <div className="flex flex-column gap-2">
                                <Rating value={data.rating} readOnly cancel={false}></Rating>
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-tag product-category-icon"></i>
                                    <span className="font-semibold">{data.genre}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="card flex justify-content-center">
            <Sidebar visible={visible} onHide={() => setVisible(false)}>
                <h2>Sidebar</h2>
                <div className="card">
                    <DataScroller value={movies} itemTemplate={itemTemplate} rows={5} inline scrollHeight="500px"
                                  header="Scroll Down to Load More"/>
                </div>
            </Sidebar>
            <Button icon="pi pi-arrow-right" onClick={() => setVisible(true)}/>
        </div>
    )
}
