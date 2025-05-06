#!/bin/bash
find src -type f -name "*.tsx" -exec sed -i "" -E "s|//.*$||g" {} \;
find src -type f -name "*.tsx" -exec sed -i "" -E "s|/\*.*\*/||g" {} \;
echo "Semua komentar telah dihapus dari file TSX."
