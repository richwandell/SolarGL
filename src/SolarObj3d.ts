class SolarObj3d {
    private _faces: number[] = [];
    private _dim: number = 3;
    private _colors: number[] = [];
    private _indices: number[] = [];
    private _normals: number[] = [];
    private _textureCoords: number[] = [];
    private _image: ImageBitmap | undefined;

    get image(): ImageBitmap | undefined {
        return this._image;
    }

    set image(value: ImageBitmap | undefined) {
        this._image = value;
    }

    get textureCoords(): number[] {
        return this._textureCoords;
    }

    set textureCoords(value: number[]) {
        this._textureCoords = value;
    }

    get normals(): number[] {
        return this._normals;
    }

    set normals(value: number[]) {
        this._normals = value;
    }


    get indices(): number[] {
        return this._indices;
    }

    set indices(value: number[]) {
        this._indices = value;
    }

    get colors(): number[] {
        return this._colors;
    }

    set colors(value: number[]) {
        this._colors = value;
    }

    get faces(): number[] {
        return this._faces;
    }

    set faces(value: number[]) {
        this._faces = value;
    }

    get dim(): number {
        return this._dim;
    }

    set dim(value: number) {
        this._dim = value;
    }

}

export default SolarObj3d;
