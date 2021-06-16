import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Comment } from './Comment';
import { Category } from './Category';
import { Film } from './Film';

@Entity()
export class Reply extends BaseEntity {
    constructor(parent: Comment, child: Comment) {
        super();
        this.child = child;
        this.parent = parent;
    }
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
