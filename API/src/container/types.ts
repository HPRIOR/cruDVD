// this is used to allow interfaces to be used by DI container

const TYPES = {
    IFilmDAO: Symbol.for('IFilmDAO'),
    ICommentDAO: Symbol.for('ICommentDAO'),
};

export { TYPES };
