/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl: string;
  paperUrl: string;
  projectUrl: string;
  tags: string[];
  category?: string;
  subCategory?: string;
}

export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
