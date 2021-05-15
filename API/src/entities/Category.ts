import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { FilmCategory } from './FilmCategory';

@Entity()
export class Category extends BaseEntity {
    @OneToOne(() => FilmCategory, filmCat => filmCat.category_id)
    @PrimaryColumn()
    category_id: number;

    @Column()
    name: string;

    @UpdateDateColumn()
    last_update: string;
}
