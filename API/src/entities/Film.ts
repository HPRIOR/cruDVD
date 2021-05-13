import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Field, Float, ID, Int, ObjectType } from 'type-graphql';
import { FilmCategory } from './FilmCategory';

@ObjectType()
@Entity()
export class Film extends BaseEntity {
  @Field(() => ID)
  @OneToMany(() => FilmCategory, film => film.film_id)
  @PrimaryColumn('integer')
  film_id: number;

  @Field(() => String)
  @Column('varchar')
  title: string;

  @Field(() => String)
  @Column('text')
  description: string;

  @Field(() => String)
  @Column()
  release_year: string;

  @Field(() => Int)
  @Column('smallint')
  language_id: number;

  @Field(() => Int)
  @Column('smallint')
  rental_duration: number;

  @Field(() => Float)
  @Column('numeric')
  rental_rate: number;

  @Field(() => Int)
  @Column('smallint')
  length: number;

  @Field(() => Float)
  @Column('numeric')
  replacement_cost: number;

  @Field(() => String)
  @Column()
  rating: string;

  @Field(() => String)
  @Column('timestamp')
  last_update: string;

  @Field(() => [String])
  @Column('timestamp')
  special_features: string[];

  @Field()
  @Column('tsvector')
  fulltext: string;
}
