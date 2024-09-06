package models

import (
	"time"
)

type DropletStatsHistory struct {
	ID             uint64    `gorm:"primary_key"`
	TotalDroplets  int64     `gorm:"column:total_droplets"`
	TotalAddresses int64     `gorm:"column:total_addresses"`
	Height         int64     `gorm:"column:height"`
	DateBlock      time.Time `gorm:"column:date_block"`
	DateCreated    time.Time `gorm:"column:date_created"`
}

func (DropletStatsHistory) TableName() string {
	return "droplet_stats_history"
}
