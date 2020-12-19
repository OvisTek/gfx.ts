import { Vector3 } from "./vector3";
import { Quaternion } from "./quaternion";

/**
 * Interface for serialising and deserialising Matrix4 structure
 * for storage/database purposes
 */
export interface JsonMatrix4 {
	// first
	readonly m00: number;
	readonly m10: number;
	readonly m20: number;
	readonly m30: number;

	// second
	readonly m01: number;
	readonly m11: number;
	readonly m21: number;
	readonly m31: number;

	// third
	readonly m02: number;
	readonly m12: number;
	readonly m22: number;
	readonly m32: number;

	// fourth
	readonly m03: number;
	readonly m13: number;
	readonly m23: number;
	readonly m33: number;
}

/**
 * 16 value column-major 4x4 Matrix
 */
export class Matrix4 {
	private readonly val: number[];

	/**
	 * Initialise a new Matrix as the default Identity Matrix
	 */
	constructor() {
		// init to identity matrix
		this.val = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	}

	/**
	 * Serialise this Matrix for storage/database purposes
	 * See JsonMatrix4 Interface for details
	 */
	public serialise(): JsonMatrix4 {
		const m: number[] = this.val;

		return {
			// first
			m00: m[0],
			m10: m[1],
			m20: m[2],
			m30: m[3],
			// second
			m01: m[4],
			m11: m[5],
			m21: m[6],
			m31: m[7],
			// third
			m02: m[8],
			m12: m[9],
			m22: m[10],
			m32: m[11],
			// fourth
			m03: m[12],
			m13: m[13],
			m23: m[14],
			m33: m[15],
		}
	}

	/**
	 * Deserialise a previously serialised version of a Matrix
	 * 
	 * @param values The serialised Matrix to deserialise
	 */
	public static deserialise(values: JsonMatrix4): Matrix4 {
		return new Matrix4().deserialise(values);
	}

	/**
	 * Deserialise a previously serialised version of a Matrix
	 *
	 * @param values The serialised Matrix to deserialise
	 */
	public deserialise(values: JsonMatrix4): Matrix4 {
		return this.set(
			values.m00, values.m01, values.m02, values.m03,
			values.m10, values.m11, values.m12, values.m13,
			values.m20, values.m21, values.m22, values.m23,
			values.m30, values.m31, values.m32, values.m33
		);
	}

	/**
	 * Sets this matrix to a projection matrix useful for controlling a Projection Camera
	 * 
	 * @param near The near plane of the projection
	 * @param far The far plane of the projection
	 * @param fov The field of view
	 * @param aspect The aspect ratio, typically width/height of the window
	 */
	public setToProjection(near: number, far: number, fov: number, aspect: number): Matrix4 {
		const fd: number = 1.0 / Math.tan((fov * (Math.PI / 180.0)) / 2.0);
		const a1: number = (far + near) / (near - far);
		const a2: number = (2.0 * far * near) / (near - far);

		const m: number[] = this.val;

		m[0] = fd / aspect;
		m[1] = 0;
		m[2] = 0;
		m[3] = 0;
		m[4] = 0;
		m[5] = fd;
		m[6] = 0;
		m[7] = 0;
		m[8] = 0;
		m[9] = 0;
		m[10] = a1;
		m[11] = -1;
		m[12] = 0;
		m[13] = 0;
		m[14] = a2;
		m[15] = 0;

		return this;
	}

	/**
	 * Sets the current matrix with the provided values
	 * 
	 * [m00, m10, m20, m30]
	 * [m01, m11, m21, m31]
	 * [m02, m12, m22, m32]
	 * [m03, m13, m23, m33]
	 */
	public set(
		m00: number, m01: number, m02: number, m03: number,
		m10: number, m11: number, m12: number, m13: number,
		m20: number, m21: number, m22: number, m23: number,
		m30: number, m31: number, m32: number, m33: number): Matrix4 {

		const m: number[] = this.val;

		// first
		m[0] = m00;
		m[1] = m10;
		m[2] = m20;
		m[3] = m30;

		// second
		m[4] = m01;
		m[5] = m11;
		m[6] = m21;
		m[7] = m31;

		// third
		m[8] = m02;
		m[9] = m12;
		m[10] = m22;
		m[11] = m32;

		// fourth
		m[12] = m03;
		m[13] = m13;
		m[14] = m23;
		m[15] = m33;

		return this;
	}

	/**
	 * Copies the components of the provided array into the provided Matrix
	 * 
	 * @param values The values to copy
	 */
	public fromArray(values: number[]): Matrix4 {
		if (values.length < 16) {
			throw new Error("Matrix4.fromArray(number[]) - provided argument length must be >= 16");
		}

		const m: number[] = this.val;

		// first
		m[0] = values[0];
		m[1] = values[1];
		m[2] = values[2];
		m[3] = values[3];

		// second
		m[4] = values[4];
		m[5] = values[5];
		m[6] = values[6];
		m[7] = values[7];

		// third
		m[8] = values[8];
		m[9] = values[9];
		m[10] = values[10];
		m[11] = values[11];

		// fourth
		m[12] = values[12];
		m[13] = values[13];
		m[14] = values[14];
		m[15] = values[15];

		return this;
	}

	/**
	 * Copies an existing Matrix into this Matrix
	 * 
	 * @param matrix The Matrix to copy
	 */
	public copy(matrix: Matrix4): Matrix4 {
		return this.fromArray(matrix.val);
	}

	/**
	 * Clones the current matrix and returns a new instance
	 */
	public clone(): Matrix4 {
		return new Matrix4().fromArray(this.val);
	}

	/**
	 * Converts this Matrix into the Identity Matrix
	 */
	public identity(): Matrix4 {
		this.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);

		return this;
	}

	/**
	 * Calculate and return the inverse of this Matrix
	 */
	public invert(): Matrix4 {
		const det: number = this.determinant;

		if (det == 0) {
			throw new Error("Matrix4.invert() - cannot invert Matrix as determinant is 0");
		}

		const m: number[] = this.val;

		const m00: number = m[9] * m[14] * m[7] - m[13] * m[10] * m[7] + m[13] * m[6] * m[11] - m[5] * m[14] * m[11] - m[9] * m[6] * m[15] + m[5] * m[10] * m[15];
		const m01: number = m[12] * m[10] * m[7] - m[8] * m[14] * m[7] - m[12] * m[6] * m[11] + m[4] * m[14] * m[11] + m[8] * m[6] * m[15] - m[4] * m[10] * m[15];
		const m02: number = m[8] * m[13] * m[7] - m[12] * m[9] * m[7] + m[12] * m[5] * m[11] - m[4] * m[13] * m[11] - m[8] * m[5] * m[15] + m[4] * m[9] * m[15];
		const m03: number = m[12] * m[9] * m[6] - m[8] * m[13] * m[6] - m[12] * m[5] * m[10] + m[4] * m[13] * m[10] + m[8] * m[5] * m[14] - m[4] * m[9] * m[14];
		const m10: number = m[13] * m[10] * m[3] - m[9] * m[14] * m[3] - m[13] * m[2] * m[11] + m[1] * m[14] * m[11] + m[9] * m[2] * m[15] - m[1] * m[10] * m[15];
		const m11: number = m[8] * m[14] * m[3] - m[12] * m[10] * m[3] + m[12] * m[2] * m[11] - m[0] * m[14] * m[11] - m[8] * m[2] * m[15] + m[0] * m[10] * m[15];
		const m12: number = m[12] * m[9] * m[3] - m[8] * m[13] * m[3] - m[12] * m[1] * m[11] + m[0] * m[13] * m[11] + m[8] * m[1] * m[15] - m[0] * m[9] * m[15];
		const m13: number = m[8] * m[13] * m[2] - m[12] * m[9] * m[2] + m[12] * m[1] * m[10] - m[0] * m[13] * m[10] - m[8] * m[1] * m[14] + m[0] * m[9] * m[14];
		const m20: number = m[5] * m[14] * m[3] - m[13] * m[6] * m[3] + m[13] * m[2] * m[7] - m[1] * m[14] * m[7] - m[5] * m[2] * m[15] + m[1] * m[6] * m[15];
		const m21: number = m[12] * m[6] * m[3] - m[4] * m[14] * m[3] - m[12] * m[2] * m[7] + m[0] * m[14] * m[7] + m[4] * m[2] * m[15] - m[0] * m[6] * m[15];
		const m22: number = m[4] * m[13] * m[3] - m[12] * m[5] * m[3] + m[12] * m[1] * m[7] - m[0] * m[13] * m[7] - m[4] * m[1] * m[15] + m[0] * m[5] * m[15];
		const m23: number = m[12] * m[5] * m[2] - m[4] * m[13] * m[2] - m[12] * m[1] * m[6] + m[0] * m[13] * m[6] + m[4] * m[1] * m[14] - m[0] * m[5] * m[14];
		const m30: number = m[9] * m[6] * m[3] - m[5] * m[10] * m[3] - m[9] * m[2] * m[7] + m[1] * m[10] * m[7] + m[5] * m[2] * m[11] - m[1] * m[6] * m[11];
		const m31: number = m[4] * m[10] * m[3] - m[8] * m[6] * m[3] + m[8] * m[2] * m[7] - m[0] * m[10] * m[7] - m[4] * m[2] * m[11] + m[0] * m[6] * m[11];
		const m32: number = m[8] * m[5] * m[3] - m[4] * m[9] * m[3] - m[8] * m[1] * m[7] + m[0] * m[9] * m[7] + m[4] * m[1] * m[11] - m[0] * m[5] * m[11];
		const m33: number = m[4] * m[9] * m[2] - m[8] * m[5] * m[2] + m[8] * m[1] * m[6] - m[0] * m[9] * m[6] - m[4] * m[1] * m[10] + m[0] * m[5] * m[10];

		const idet: number = 1.0 / det;

		m[0] = m00 * idet;
		m[1] = m10 * idet;
		m[2] = m20 * idet;
		m[3] = m30 * idet;
		m[4] = m01 * idet;
		m[5] = m11 * idet;
		m[6] = m21 * idet;
		m[7] = m31 * idet;
		m[8] = m02 * idet;
		m[9] = m12 * idet;
		m[10] = m22 * idet;
		m[11] = m32 * idet;
		m[12] = m03 * idet;
		m[13] = m13 * idet;
		m[14] = m23 * idet;
		m[15] = m33 * idet;

		return this;
	}

	/**
	 * Calculate and return the transpose of this Matrix
	 */
	public transpose(): Matrix4 {
		const m: number[] = this.val;

		const m01: number = m[4];
		const m02: number = m[8];
		const m03: number = m[12];
		const m12: number = m[9];
		const m13: number = m[13];
		const m23: number = m[14];

		m[4] = m[1];
		m[8] = m[2];
		m[12] = m[3];
		m[1] = m01;
		m[9] = m[6];
		m[13] = m[7];
		m[2] = m02;
		m[6] = m12;
		m[14] = m[11];
		m[3] = m03;
		m[7] = m13;
		m[11] = m23;

		return this;
	}

	/**
	 * Calculate and return the determinant of this Matrix
	 */
	public get determinant(): number {
		const m: number[] = this.val;

		return m[3] * m[6] * m[9] * m[12] - m[2] * m[7] * m[9] * m[12] - m[3] * m[5]
			* m[10] * m[12] + m[1] * m[7] * m[10] * m[12] + m[2] * m[5] * m[11] * m[12] - m[1]
			* m[6] * m[11] * m[12] - m[3] * m[6] * m[8] * m[13] + m[2] * m[7] * m[8] * m[13]
			+ m[3] * m[4] * m[10] * m[13] - m[0] * m[7] * m[10] * m[13] - m[2] * m[4] * m[11]
			* m[13] + m[0] * m[6] * m[11] * m[13] + m[3] * m[5] * m[8] * m[14] - m[1] * m[7]
			* m[8] * m[14] - m[3] * m[4] * m[9] * m[14] + m[0] * m[7] * m[9] * m[14] + m[1]
			* m[4] * m[11] * m[14] - m[0] * m[5] * m[11] * m[14] - m[2] * m[5] * m[8] * m[15]
			+ m[1] * m[6] * m[8] * m[15] + m[2] * m[4] * m[9] * m[15] - m[0] * m[6] * m[9]
			* m[15] - m[1] * m[4] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
	}

	/**
	 * Access the array reference for this matrix
	 */
	public get elements(): number[] {
		return this.val;
	}
}