import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Actor } from './Actor';
import { Film } from './Film';

@Entity()
export class FilmActor extends BaseEntity {
    @PrimaryColumn()
    actor_id: number; // type = Actor, ManyToOne
    @JoinColumn({ name: 'actor_id' })
    @ManyToOne(() => Actor, actor => actor.film_actor)
    actor: Actor;

    @PrimaryColumn()
    film_id: number; // type = Film, ManyToOne
    @JoinColumn({ name: 'film_id' })
    @ManyToOne(() => Film, film => film.film_actor)
    film: Film;

    @UpdateDateColumn()
    last_update: string;
}
