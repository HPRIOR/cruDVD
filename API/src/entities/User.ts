import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';

@Entity()
@ObjectType()
export class User extends BaseEntity {
    @PrimaryColumn()
    @Field()
    id!: string;

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
}
