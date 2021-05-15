import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';

@Entity()
@ObjectType()
export class Actor extends BaseEntity {
    @PrimaryColumn()
    @OneToOne(() => Actor, actor => actor.actor_id)
    actor_id: number;

    @Column()
    @Field()
    first_name: string;

    @Column()
    @Field()
    last_name: string;

    @UpdateDateColumn()
    last_update: string;
}
