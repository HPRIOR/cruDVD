import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Comment } from './Comment';
import { Category } from './Category';
import { Film } from './Film';

@Entity()
export class CommentChild extends BaseEntity {
    @PrimaryColumn()
    parent_id!: number;
    @JoinColumn({ name: 'parent_id' })
    @OneToOne(() => Comment, comment => comment.comment_id)
    parent: Comment;

    @PrimaryColumn()
    child_id!: number;
    @JoinColumn({ name: 'child_id' })
    @OneToOne(() => Comment, comment => comment.comment_id)
    child: Comment;
}
