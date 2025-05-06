#!/bin/bash
find src -type f -name "*.tsx" -exec grep -l "/\*" {} \;
