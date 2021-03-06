import { objectIdType } from "@factor/post/util"
import isEmail from "validator/lib/isEmail"
import isMobilePhone from "validator/lib/isMobilePhone"

import { applyFilters } from "@factor/api"
import bcrypt from "bcryptjs"
import { HookNextFunction, Schema, Document } from "mongoose"
import { FactorSchema } from "@factor/post/types"
import { FactorUser } from "./types"

export default (): FactorSchema => {
  return {
    name: "user",
    permissions: {
      retrieve: { accessLevel: 0 }
    },
    callback: (_s: Schema): void => {
      // PASSWORDS
      _s.methods.comparePassword = async function comparePassword(
        candidate: string
      ): Promise<boolean> {
        return bcrypt.compare(candidate, this.password)
      }
      _s.pre("save", async function(this: FactorUser & Document, next: HookNextFunction) {
        if (!this.isModified("password") || !this.password) {
          return next()
        }

        try {
          this.password = await bcrypt.hash(this.password, 10)
          return next()
        } catch (error) {
          return next(error)
        }
      })

      _s.pre("save", function(this: FactorUser & Document, next: HookNextFunction) {
        if (this.username) this.permalink = `@${this.username}`

        if (this.displayName) this.title = this.displayName

        next()
      })

      applyFilters("user-schema-hooks", _s)
    },
    schema: applyFilters("user-schema", {
      signedInAt: Date,
      username: {
        type: String,
        trim: true,
        index: { unique: true, sparse: true },
        minlength: 3
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: { unique: true },
        validate: {
          validator: (v: string): boolean => isEmail(v) || false,
          message: `Email is invalid.`
        }
      },
      emailVerified: { type: Boolean, default: false },
      password: {
        select: false,
        type: String,
        trim: true,
        minlength: 8
      },
      displayName: {
        type: String,
        trim: true
      },
      phoneNumber: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
          validator: (v: string): boolean => isMobilePhone(v),
          message: `Phone number is invalid.`
        }
      },

      covers: [{ type: objectIdType(), ref: "attachment" }],
      birthday: Date,
      gender: {
        type: String,
        enum: ["male", "female"]
      },
      about: String
    }),
    options: {
      toObject: { virtuals: true },
      toJSON: { virtuals: true }
    }
  }
}
