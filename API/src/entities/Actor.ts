import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { FilmActor } from './FilmActor';

@Entity({ synchronize: false })
@ObjectType()
export class Actor extends BaseEntity {
    @PrimaryColumn()
    actor_id: number;

    @OneToMany(() => FilmActor, filmActor => filmActor.actor)
    film_actor: FilmActor;

    @Column()
    @Field({ nullable: true })
    first_name: string;

    @Column()
    @Field()
    last_name: string;

    @UpdateDateColumn()
    last_update: string;
}
