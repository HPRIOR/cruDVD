import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Field } from 'type-graphql';
import { Film } from './Film';

@Entity()
export class Comment extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    comment_id: string;

    @Field()
    @OneToOne(() => Film, film => film.film_id)
    @Column()
    film_id: number;

    @Field()
    @Column()
    user_id: string;

    @Field()
    @Column()
    content: string;

    @Field()
    @UpdateDateColumn()
    updatedAt: string;

    @Field()
    @CreateDateColumn()
    createdAt: string;
}
