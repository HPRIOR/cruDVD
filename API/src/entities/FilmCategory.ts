import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Category } from './Category';
import { Film } from './Film';

@Entity()
export class FilmCategory extends BaseEntity {
    @PrimaryColumn()
    category_id: number;
    @JoinColumn({ name: 'category_id' })
    @OneToOne(() => Category, cat => cat.film_category)
    category: Category;

    @PrimaryColumn()
    film_id: number;
    @JoinColumn({ name: 'film_id' })
    @OneToOne(() => Film, film => film.film_category)
    film: Film;

    @Column()
    last_update: string;
}
