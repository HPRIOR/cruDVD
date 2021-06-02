import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { FilmActor } from './FilmActor';
import { Film } from './Film';

@Entity()
export class Language extends BaseEntity {
    @PrimaryColumn()
    language_id: number;
    @JoinColumn({ name: 'language_id' })
    @OneToOne(() => Film, film => film.language)
    film: Film;

    @Column()
    name: number;
    @UpdateDateColumn()
    last_update: number;
}
