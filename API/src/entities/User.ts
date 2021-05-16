import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';

@Entity()
@ObjectType()
export class User extends BaseEntity {
    @PrimaryColumn()
    @Field()
    id!: string;

    @Column({ unique: true })
    @Field()
    username!: string;

    @Column()
    password!: string;

    @Column({ default: 0 })
    count: number;
}
