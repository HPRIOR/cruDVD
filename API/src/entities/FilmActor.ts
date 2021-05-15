import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Actor } from './Actor';
import { Film } from './Film';

@Entity()
export class FilmActor extends BaseEntity {
    @PrimaryColumn()
    @OneToOne(() => Actor, actor => actor.actor_id)
    actor_id: number;

    @PrimaryColumn()
    @OneToOne(() => Film, film => film.film_id)
    film_id: number;

    @UpdateDateColumn()
    last_update: string;
}