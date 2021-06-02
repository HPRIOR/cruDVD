import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { Film } from './Film';

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
    @Field()
    @PrimaryColumn()
    comment_id!: string;

    @Field()
    @OneToOne(() => Film, film => film.film_id)
    @Column()
    film_id!: number; // type Film

    @Field()
    @Column()
    user_id!: string;

    @Field()
    @Column()
    content!: string;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;

    @Field(() => String)
    @CreateDateColumn()
    createdAt!: Date;
}
