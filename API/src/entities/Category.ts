import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Field, Float, ID, Int, ObjectType } from 'type-graphql';
import { FilmCategory } from './FilmCategory';

@ObjectType()
@Entity()
export class Category extends BaseEntity {
  @OneToMany(() => FilmCategory, filmCat => filmCat.category_id)
  @PrimaryColumn()
  @Field()
  category_id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  last_update: string;
}
