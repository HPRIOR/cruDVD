import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Field, Float, ID, Int, ObjectType } from 'type-graphql';
import { Category } from './Category';
import { Film } from './Film';

@Entity()
export class FilmCategory extends BaseEntity {
  @ManyToOne(() => Category, cat => cat.category_id)
  @PrimaryColumn()
  category_id: number;

  @ManyToOne(() => Film, film => film.film_id)
  @PrimaryColumn()
  film_id: number;

  @Column()
  last_updated: string;
}
