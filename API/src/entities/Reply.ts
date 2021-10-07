import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Comment } from './Comment';

@Entity()
export class Reply extends BaseEntity {
    @PrimaryColumn()
    parent_id!: number;
    @JoinColumn({ name: 'parent_id' })
    @ManyToOne(() => Comment, comment => comment.comment_id)
    parent: Comment;
    @PrimaryColumn()
    child_id!: number;
    @JoinColumn({ name: 'child_id' })
    @ManyToOne(() => Comment, comment => comment.comment_id)
    child: Comment;

    constructor(parent: Comment, child: Comment) {
        super();
        this.child = child;
        this.parent = parent;
    }
}
