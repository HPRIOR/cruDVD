import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { FilmCategory } from './FilmCategory';

@Entity({ synchronize: false })
export class Category extends BaseEntity {
    @PrimaryColumn()
    category_id: number;

    @Column()
    name: string;

    @UpdateDateColumn()
    last_update: string;

    @OneToOne(() => FilmCategory, filmCat => filmCat.category)
    film_category: FilmCategory;
}
