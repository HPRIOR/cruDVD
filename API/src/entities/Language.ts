import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { FilmActor } from './FilmActor';
import { Film } from './Film';

@Entity()
export class Language extends BaseEntity {
    @PrimaryColumn()
    @OneToOne(() => Film, film => film.language_id)
    language_id: number;
    @Column()
    name: number;
    @UpdateDateColumn()
    last_update: number;
}
