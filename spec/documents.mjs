
import test from 'node:test';
import { strict as assert } from 'node:assert';
import {q, client, schema, drop_schema, fql_migrate} from "../src/main.mjs";
import { random_name } from "./_helper.mjs";

const {Ref, Collection} = q;
