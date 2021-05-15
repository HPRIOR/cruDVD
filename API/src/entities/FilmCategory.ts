import { BaseEntity, Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { Category } from './Category';
import { Film } from './Film';

@Entity()
export class FilmCategory extends BaseEntity {
    @OneToOne(() => Category, cat => cat.category_id)
    @PrimaryColumn()
    category_id: number;

    @OneToOne(() => Film, film => film.film_id)
    @PrimaryColumn()
    film_id: number;

    @Column()
    last_update: string;
}
