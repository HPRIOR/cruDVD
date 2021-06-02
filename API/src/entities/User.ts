import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

@Entity()
@ObjectType()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id!: number;

    @Column({ unique: true })
    @Field()
    username!: string;

    @Column({ unique: true })
    @Field()
    email!: string;

    @Column()
    password!: string;

    @Column({ default: 0 })
    count: number;

    //TODO updated at

    //TODO created at
}
