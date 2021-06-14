import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { Film } from './Film';
import { User } from './User';

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    comment_id!: number;

    @Field()
    @Column()
    film_id!: number; // type Film

    @JoinColumn({ name: 'film_id' })
    @OneToOne(() => Film, film => film.film_id)
    film: Film;

    @Field()
    @Column()
    content!: string;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;

    @Field(() => String)
    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    @Field(() => ID)
    user_id: number;

    @JoinColumn({ name: 'user_id' })
    @ManyToOne(() => User, user => user.comment)
    user: User;
}
