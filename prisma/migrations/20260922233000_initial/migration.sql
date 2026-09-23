-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MasterDataType" AS ENUM ('CLIENT', 'PRODUCT', 'WAREHOUSE', 'DESTINATION', 'CARRIER', 'HOLD', 'SHIFT', 'STATUS', 'BERTH', 'PLATE');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'standard',
    "userLimit" INTEGER NOT NULL DEFAULT 25,
    "operationLimit" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyUser" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" "RoleKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterDataItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "MasterDataType" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MasterDataItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "vesselName" TEXT NOT NULL,
    "berth" TEXT NOT NULL,
    "importer" TEXT,
    "productSummary" TEXT,
    "status" "OperationStatus" NOT NULL DEFAULT 'PLANNING',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "berthedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationHold" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plannedTons" DECIMAL(14,3) NOT NULL,

    CONSTRAINT "OperationHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "di" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "quantityTons" DECIMAL(14,3) NOT NULL,
    "situation" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "warehouse" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlanningItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningItemHold" (
    "id" TEXT NOT NULL,
    "planningItemId" TEXT NOT NULL,
    "holdId" TEXT NOT NULL,
    "tons" DECIMAL(14,3) NOT NULL,

    CONSTRAINT "PlanningItemHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DischargeRecord" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "planningItemId" TEXT NOT NULL,
    "holdId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shift" TEXT NOT NULL,
    "netWeightTons" DECIMAL(14,3) NOT NULL,
    "plate" TEXT,
    "ticket" TEXT,
    "entryTime" TEXT,
    "exitTime" TEXT,
    "serviceTimeMinutes" INTEGER,
    "notes" TEXT,
    "isSweep" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DischargeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "recordId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CompanyUser_userId_idx" ON "CompanyUser"("userId");

-- CreateIndex
CREATE INDEX "CompanyUser_companyId_roleId_idx" ON "CompanyUser"("companyId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyUser_companyId_userId_key" ON "CompanyUser"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_action_key" ON "Permission"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "MasterDataItem_companyId_type_idx" ON "MasterDataItem"("companyId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MasterDataItem_companyId_type_code_key" ON "MasterDataItem"("companyId", "type", "code");

-- CreateIndex
CREATE INDEX "Operation_companyId_status_startedAt_idx" ON "Operation"("companyId", "status", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Operation_companyId_code_key" ON "Operation"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "OperationHold_operationId_code_key" ON "OperationHold"("operationId", "code");

-- CreateIndex
CREATE INDEX "PlanningItem_companyId_operationId_idx" ON "PlanningItem"("companyId", "operationId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanningItem_operationId_sequence_key" ON "PlanningItem"("operationId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "PlanningItemHold_planningItemId_holdId_key" ON "PlanningItemHold"("planningItemId", "holdId");

-- CreateIndex
CREATE INDEX "DischargeRecord_companyId_operationId_date_idx" ON "DischargeRecord"("companyId", "operationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DischargeRecord_operationId_ticket_key" ON "DischargeRecord"("operationId", "ticket");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_entity_createdAt_idx" ON "AuditLog"("companyId", "entity", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterDataItem" ADD CONSTRAINT "MasterDataItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationHold" ADD CONSTRAINT "OperationHold_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningItem" ADD CONSTRAINT "PlanningItem_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningItemHold" ADD CONSTRAINT "PlanningItemHold_planningItemId_fkey" FOREIGN KEY ("planningItemId") REFERENCES "PlanningItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningItemHold" ADD CONSTRAINT "PlanningItemHold_holdId_fkey" FOREIGN KEY ("holdId") REFERENCES "OperationHold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeRecord" ADD CONSTRAINT "DischargeRecord_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeRecord" ADD CONSTRAINT "DischargeRecord_planningItemId_fkey" FOREIGN KEY ("planningItemId") REFERENCES "PlanningItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeRecord" ADD CONSTRAINT "DischargeRecord_holdId_fkey" FOREIGN KEY ("holdId") REFERENCES "OperationHold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

