import { BaseEntity, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Actor } from './Actor';
import { Film } from './Film';

@Entity()
export class FilmActor extends BaseEntity {
    @PrimaryColumn()
    @OneToOne(() => Actor, actor => actor.actor_id)
    actor_id: number; // type = Actor, ManyToOne

    @PrimaryColumn()
    @OneToOne(() => Film, film => film.film_id)
    film_id: number; // type = Film, ManyToOne

    @UpdateDateColumn()
    last_update: string;
}
